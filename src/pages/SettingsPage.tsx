import { useEffect, useState } from "react";
import Checkbox from "../components/generic/Checkbox";
import { clangenRunner } from "../python/clangenRunner";
import BasePage from "../layout/BasePage";
import { useNavigate } from "react-router";
import Select, { SelectOption } from "../components/generic/Select";

const settingLabels: Record<string, Record<string, string>> = {
  disasters: {
    label: "Allow mass extinction events",
  },
  deputy: {
    label:
      "Allow leaders to automatically choose a new deputy. The Warrior Code rules will be taken into account when choosing a deputy.",
  },
  "12_moon_graduation": {
    label: "Disable experience-based apprentice graduation.",
  },
  retirement: {
    label: "Cats will never retire due to a permanent condition",
  },
  become_mediator: {
    label: "Allow warriors and elders to choose to become mediators",
  },
  affair: {
    label: "Allow cats to breed with cats that aren't their mates",
  },
  "same sex birth": {
    label: "Pregnancy ignores biology",
  },
  "same sex adoption": {
    label: "Increase same-sex adoption",
  },
  "single parentage": {
    label: "Allow cats to have kittens with an unknown second parent",
  },
  "romantic with former mentor": {
    label: "Allow romantic interactions with former mentors",
  },
  "first cousin mates": {
    label: "Allow first cousins to be mates and have romantic interactions",
  },
};

function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [customCss, setCustomCss] = useState("");
  const [shading, setShading] = useState(false);
  const [saveAsZip, setSaveAsZip] = useState(false);
  const [siteTheme, setSiteTheme] = useState("");
  const navigator = useNavigate();

  let siteThemes: SelectOption[] = [
    {
      label: "Sync with System",
      value: "auto"
    },
    {
      label: "Light",
      value: "theme-light"
    },
    {
      label: "Dark",
      value: "theme-dark"
    },
    {
      label: "ClanGen Dark (Partially Complete)",
      value: "theme-clangen-dark"
    },
    {
      label: "Custom Theme",
      value: "theme-custom"
    },
  ];

  const [customTheme, setCustomTheme] = useState<Record<string, any>>({
    ["--page-background-color"]: "rgb(56,50,38)",
    ["--text-color"]: "black",
    ["--link-color"]: "rgb(106, 57, 69)",
    ["--content-background-color"]: "white",

    ["--navbar-background-color"]: "#655934",
    ["--navbar-text-color"]: "#EFE5CE",
    ["--navbar-hovered-text-color"]: "rgb(48,41,28)",

    ["--breadcrumbs-background-color"]: "rgb(234, 234, 234)",
    ["--cat-display-hovered-background-color"]: "#EFE5CE",

    ["--progress-bar-bg"]: "rgb(231, 231, 231)",
    ["--progress-bar-fill"]: "#80bc08",

    ["--icon-button-text-color"]: "darkgray",
    ["--icon-button-hovered-text-color"]: "gray",

    ["--button-background-color"]: "#655934",
    ["--button-hovered-background-color"]: "rgb(82, 73, 55)",
    ["--button-text-color"]: "#EFE5CE",
    ["--button-disabled-background-color"]: "#938764",

    ["--button-secondary-background-color"]: "#EFE5CE",
    ["--button-secondary-hovered-background-color"]: "#e5c680",
    ["--button-secondary-text-color"]: "#655934",

    ["--summary-background-color"]: "#EFE5CE"
  });

  const [customThemeCSS, setCustomThemeCSS] = useState<string>("");

  function formatPropertyName(propName: string) {
    return propName
    .substring(2)
    .replace(/-/g, ' ')
    .replace(/(^|\s)[a-z]/gi, l => l.toUpperCase());
  }

  function setCustomThemeProperty(propName: string, value: any) {
    setCustomTheme({
      ...customTheme,
      [propName]: value
    });
  }

  function loadCustomTheme() {
    let style = getComputedStyle(document.documentElement);
    Object.keys(customTheme).map(propName => {
      setCustomThemeProperty(propName, style.getPropertyValue(propName));
    });
  }

  function generateCustomThemeCSS() {
    let finalCSS = ".theme-custom {\n";
    Object.keys(customTheme).map(propName => {
      finalCSS = finalCSS.concat(`${propName}: ${customTheme[propName]};\n`);
    });
    finalCSS = finalCSS.concat(`${customThemeCSS}\n}`);
    return finalCSS;
  }

  useEffect(() => {
    document.title = "Settings | ClanGen Simulator";
  }, []);

  useEffect(() => {
    // disable on this page so users don't softlock themselves
    const customCssElement = document.getElementById("custom-css");
    if (customCssElement) {
      customCssElement.textContent = "";
    }

    const storedSiteTheme = localStorage.getItem("site-theme");
    if (storedSiteTheme) {
      setSiteTheme(storedSiteTheme);
    } else {
      setSiteTheme("auto");
    }

    loadCustomTheme();

    const storedCss = localStorage.getItem("custom-css");
    if (storedCss) {
      setCustomCss(storedCss);
    }

    const shadingEnabled = localStorage.getItem("shading-enabled");
    if (shadingEnabled) {
      setShading(shadingEnabled !== null);
    }

    const storedSaveAsZip = localStorage.getItem("export-as-zip");
    if (storedSaveAsZip) {
      setSaveAsZip(storedSaveAsZip !== null)
    }

    clangenRunner.getSettings().then((s) => {
      const temp: Record<string, boolean> = {};

      // only add settings with corresponding labels
      for (const [key, value] of Object.entries(s)) {
        if (settingLabels[key] !== undefined) {
          temp[key] = value;
        }
      }
      setSettings(temp);
    });
  }, []);

  function handleSave() {
    clangenRunner.setSettings(settings).then(() => {
      localStorage.setItem("site-theme", siteTheme);

      const customCssElement = document.getElementById("custom-css");
      if (customCssElement) {
        customCssElement.textContent = customCss;
      }
      localStorage.setItem("custom-css", customCss);
      
      if (shading) {
        localStorage.setItem("shading-enabled", "true");
      } else {
        localStorage.removeItem("shading-enabled");
      }

      if (saveAsZip) {
        localStorage.setItem("export-as-zip", "true");
      } else {
        localStorage.removeItem("export-as-zip")
      }

      navigator("/");
    });
  }

  return (
    <BasePage>
      <h2>Game Settings</h2>
      {Object.entries(settings).map(([settingName, value]) => (
        <Checkbox
          key={settingName}
          label={settingLabels[settingName]?.label}
          checked={value}
          onChange={() => setSettings({ ...settings, [settingName]: !value })}
        />
      ))}

      <h2>Site Settings</h2>
      <Checkbox label="Enable shading for cat sprites" onChange={() => setShading(!shading)} checked={shading}/>
      <Checkbox label="Export save as .zip instead of .sav" onChange={() => setSaveAsZip(!saveAsZip)} checked={saveAsZip}/>
      <Select 
        label="Site theme" 
        onChange={(value: string) => setSiteTheme(value)} 
        options={siteThemes} 
        value={siteTheme}
        noEmpty={true}
      />
      <div>
        <fieldset>
          <legend>Custom Theme Settings</legend>
          
          <fieldset className="custom-theme-editor-category">
            <legend>Colors</legend>
            {
              Object.keys(customTheme).map(propName => {
                return (
                  <div className="custom-theme-color-select">
                    <input type="color" name={propName} id={propName} 
                      value={customTheme[propName]} 
                      onChange={e => setCustomThemeProperty(propName, e.target.value)}
                    />
                    <label htmlFor={propName}>{formatPropertyName(propName)}</label>
                  </div>
                )
              })
            }
          </fieldset>

          <fieldset className="custom-theme-editor-category">
            <legend>Custom Theme Extra CSS</legend>
            <textarea rows={10} cols={50} value={customThemeCSS} onChange={e => setCustomThemeCSS(e.target.value)} style={{resize: "none", width: "98%"}}></textarea>
          </fieldset>

          <hr />

          <fieldset>
            <legend>Global Custom CSS</legend>
            <textarea rows={10} cols={50} value={customCss} onChange={e => setCustomCss(e.target.value)} style={{resize: "none", width: "98%"}}></textarea>
            
            <p>Your custom CSS will be injected onto every page except for this one. For your safety, please only input CSS that you 100% trust.</p>
          </fieldset>
        </fieldset>
      </div>
      <div className="submit">
        <button onClick={handleSave}>Save</button>
      </div>
    </BasePage>
  );
}

export default SettingsPage;
