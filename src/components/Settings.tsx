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
      <Text.H2>Default Password</Text.H2>
      <TextInput
        value={defaultSetting}
        onChange={(e: string) => {
          InvSettings.set("defaultPassword", e);
          setDefaultSetting(e);
        }}
      />
      <Divider />
      <Text.H2>Saved Passwords (separated by a ", ")</Text.H2>
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
