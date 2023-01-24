import { common, components } from "replugged";
import { InvSettings } from "../utils";

const { React } = common;
const { TextInput, Text, Divider } = components;

export function Settings() {
  let [passwords, setPasswords] = React.useState(InvSettings.get("passwords", []));

  let [defaultSetting, setDefaultSetting] = React.useState(
    InvSettings.get("defaultPassword", "password"),
  );

  return (
    <>
      <Text.Eyebrow style={{ marginBottom: "5px" }}>Default Password</Text.Eyebrow>
      <TextInput
        value={defaultSetting}
        onChange={(e: string) => {
          InvSettings.set("defaultPassword", e);
          setDefaultSetting(e);
        }}
      />
      <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
      <Text.Eyebrow style={{ marginBottom: "5px" }}>
        Saved Passwords (separated by a ", ")
      </Text.Eyebrow>
      <TextInput
        placeholder="password, placeholder, test"
        value={passwords.join(", ")}
        onChange={(e: string) => {
          InvSettings.set("passwords", e.split(", "));
          setPasswords(e.split(", "));
        }}
      />
    </>
  );
}
