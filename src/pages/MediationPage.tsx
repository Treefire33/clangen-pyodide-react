import { useEffect, useState } from "react";
import { Cat } from "../python/types";
import { clangenRunner } from "../python/clangenRunner";
import Checkbox from "../components/generic/Checkbox";
import BasePage from "../layout/BasePage";

import confusedCat from "../assets/images/gen_med_newmed.png";
import CatSearch from "../components/CatSearch";
import CatDisplay from "../components/CatDisplay";
import "../styles/mediation-page.css"

const crumbs = [
  {
    url: "/",
    label: "Home",
  },
  {
    url: "/mediate",
    label: "Mediate",
  },
];

function haveMediated(cat1: string, cat2: string, mediatedPairs: [string, string][]) {
  for (const pair of mediatedPairs) {
    if (pair.includes(cat1) && pair.includes(cat2)) {
      return true;
    }
  }
  return false;
}

// TODO: switch to reducer
function MediationPage() {
  const [mediationText, setMediationText] = useState("");

  const [possibleMediators, setPossibleMediators] = useState<Cat[]>([]);
  const [possibleCats, setPossibleCats] = useState<Cat[]>([]);
  const [mediatedPairs, setMediatedPairs] = useState<[string, string][]>([]);

  const [allowRomantic, setAllowRomantic] = useState<boolean>(false);

  const [selectedMediator, setSelectedMediator] = useState<string[]>([""]);
  const [catsToMediate, setSelectedCats] = useState<string[]>(["", ""]);

  const alreadyMediated = haveMediated(catsToMediate[0], catsToMediate[1], mediatedPairs);

  const [screenState, setScreenState] = useState("start");

  const disabled = screenState !== "start";

  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  function reset() {
    setSelectedMediator([]);
    setSelectedCats([]);
    setMediationText("");
    setScreenState("start");

    clangenRunner.getPossibleMediators().then((m) => setPossibleMediators(m));
    clangenRunner.getPossibleMediated().then((m) => setPossibleCats(m));
    clangenRunner.getMediatedPairs().then((m) => setMediatedPairs(m));
  }

  useEffect(() => {
    reset();
    setIsFirstLoad(false);
  }, []);

  useEffect(() => {
    document.title = "Mediation | ClanGen Simulator";
  }, []);

  function doMediate(kind: "sabotage" | "mediate", allowRomantic: boolean) {
    setScreenState("in-progress");
    let doSabotage;
    if (kind == "sabotage") {
      doSabotage = true;
    } else {
      doSabotage = false;
    }
    clangenRunner
      .mediate(
        selectedMediator[0],
        catsToMediate[0], 
        catsToMediate[1],
        doSabotage,
        allowRomantic,
      )
      .then((m) => setMediationText(m))
      .catch((exception) => {
        alert(exception);
        reset();
      });
  }

  if (isFirstLoad) {
    return (
      <BasePage crumbs={crumbs}>
        <p>Loading...</p>
      </BasePage>
    );
  }

  if (possibleMediators.length <= 0) {
    return (
      <BasePage crumbs={crumbs}>
        <img style={{ imageRendering: "pixelated" }} src={confusedCat}></img>

        <p>
          No cats in the Clan can currently mediate. Cats with the “mediator” or
          "mediator apprentice" role without major injuries or illnesses can
          mediate once every moon.
        </p>
      </BasePage>
    );
  }

  return (
    <BasePage crumbs={crumbs}>
      <p>
        Cats with the “mediator” or "mediator apprentice" role without major injuries or
        illnesses can mediate once every moon. Mediator cats cannot patrol. Roles can be set on a cat's edit page.
      </p>

      <p>Any particular pair of cats can only be mediated once per moon.</p>

      <fieldset disabled={disabled}>
        <legend>Mediator</legend>
        <CatSearch 
          catsToSearch={possibleMediators.filter(cat => !catsToMediate.find(id => cat.ID == id))}
          catsPerPage={16}
          maxSelection={1}
          selectedCats={selectedMediator}
          setSelectedCats={setSelectedMediator}
        />
      </fieldset>

      <fieldset disabled={disabled}>
        <legend>Mediated</legend>
        <CatSearch 
          catsToSearch={possibleCats.filter(cat => cat.ID != selectedMediator[0])}
          catsPerPage={16}
          maxSelection={2}
          selectedCats={catsToMediate}
          setSelectedCats={setSelectedCats}
        />
      </fieldset>

      <fieldset>
        <legend>Current Mediation</legend>
        
        <div className="mediated-cats-list">
          {/* I'll improve this later, can't seem to think of a good way to implement it. */}
          <div className="cat" key={0}>
            {possibleCats
            .filter(cat => catsToMediate.find(id => id == cat.ID))
            .slice(0, 1).map((cat, index) => {
              return (
                <div className="cat" key={index}>
                  <CatDisplay cat={cat} w="50px" h="50px" />
                  <div>{cat.name.display}</div>
                  <div className="cat-search-select-status">{cat.status}</div>
                </div>
              );
            })}
          </div>
          <div className="cat" key={0}>
            <div>{alreadyMediated ? "X" : "⟷"}</div>
            <div className="cat-search-select-status">{alreadyMediated && "Pair has already been mediated this moon."}</div>
          </div>
          <div className="cat" key={0}>
            {possibleCats
            .filter(cat => catsToMediate.find(id => id == cat.ID))
            .slice(1, 2).map((cat, index) => {
              return (
                <div className="cat" key={index}>
                  <CatDisplay cat={cat} w="50px" h="50px" />
                  <div>{cat.name.display}</div>
                  <div className="cat-search-select-status">{cat.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Options</legend>
        <Checkbox
          label="Allow effects on romantic like, if possible"
          checked={allowRomantic}
          onChange={() => setAllowRomantic(!allowRomantic)}
        />
      </fieldset>

      <p>{mediationText}</p>

      {screenState === "start" && (
        <div className="button-row">
          <button
            tabIndex={0}
            disabled={selectedMediator.length == 0 || catsToMediate.length < 2 || alreadyMediated}
            onClick={() => doMediate("mediate", allowRomantic)}
          >
            Mediate
          </button>
          <button
            tabIndex={0}
            disabled={selectedMediator.length == 0 || catsToMediate.length < 2 || alreadyMediated}
            onClick={() => doMediate("sabotage", allowRomantic)}
          >
            Sabotage
          </button>
        </div>
      )}

      {screenState === "in-progress" && (
        <>
          <button tabIndex={0} onClick={reset}>
            Mediate Again
          </button>
        </>
      )}
    </BasePage>
  );
}

export default MediationPage;
