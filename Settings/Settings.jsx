// One of my first react components
const { React, getModule } = require("powercord/webpack");
const { FormTitle, Button } = require("powercord/components");
const { Category, SwitchItem,TextInput} = require("powercord/components/settings");

const f = require('../components/Functions.js');

const CategoryImg = require("powercord/components/settings").Category;

var userPasswords = [];
module.exports = class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.currentId = "000000000000000000";
    this.listOpened = false;
  }

  info = getModule(["getUser"], false).getUser;

  addNewUser() {
    userPasswords.push({
      open: false,
      id: "000000000000000000",
      password: "Password",
      name: "INVALID USER",
      pfp: "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png",
    });
    return userPasswords;
  }
  removeUser(i) {
    userPasswords.splice(i, 1);
    return userPasswords;
  }
  updateUserId(i, id, name, pfp) {
    userPasswords[i].id = id;
    userPasswords[i].name = name;
    userPasswords[i].pfp = pfp;
    return userPasswords;
  }
  updateUserPassword(i, password) {
    userPasswords[i].password = password;
    return userPasswords;
  }
  toggle(i, val) {
    userPasswords[i].open = val;
    return userPasswords;
  }
  updateUserPreviews() {
    userPasswords.map((user, i) => {
      var p = user.id;
      this.info(p.toString())
        .then((res) => {
          this.props.updateSetting(
            "userPasswords",
            this.updateUserId(i, p, res.username,
              'https://cdn.discordapp.com/avatars/'+res.id+'/'+res.avatar+'.webp?size=256')
          );
        })
        .catch((err) => {
          if (err) {
            this.props.updateSetting(
              "userPasswords",
              this.updateUserId(
                i,
                p,
                "INVALID USER",
                "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"
              )
            );
          }
        });
    });
  }

  render() {
    const { getSetting, updateSetting } = this.props;
    userPasswords = getSetting("userPasswords");
    if (!userPasswords) {
      userPasswords = [];
      updateSetting("userPasswords", userPasswords);
    }
    return (
      <div>
        <div>
          <SwitchItem
            disabled={false}
            onChange={(val) => {
              updateSetting("useInvisibleAttachmentButton", val);
              require('../index.js').prototype.__handleSettingsChange("useInvisibleAttachmentButton", val);
            }}
            value={getSetting("useInvisibleAttachmentButton")}
            note='REQUIRES CHANNEL SWITCH! Activating this will move the Encrypt button into the + Menu in your chatbar.'
            >
            Move Encrypt Button to Attachment Menu
          </SwitchItem>
          <FormTitle style={{ color: "lightgrey", "margin-top": "10px" }}>Add Users to Quickly Encrypt and Decrypt their Messages</FormTitle>
          <Category
            name="Users"
            description="Manage User Passwords"
            opened={this.state.listOpened}
            onChange={(p) => {
              this.updateUserPreviews();
              this.setState({ listOpened: p });
            }}
          >
            {userPasswords.map((user, i) => (
              <div>
                <CategoryImg
                  image={user.pfp}
                  name={user.name}
                  opened={user.open}
                  onChange={(p) => {
                    updateSetting("userPasswords", this.toggle(i, p));
                  }}
                >
                  <h1 style={{ color: "lightgrey", "margin-bottom": "12px" }}>
                    Basic Configuration
                  </h1>
                  <TextInput
                    defaultValue={user.id}
                    onChange={(p) => {
                      if (p.length > 18) {
                        updateSetting(
                          "userPasswords",
                          this.updateUserId(i, p.substring(0, 18))
                        );
                        return;
                      }
                      this.info(p.toString())
                        .then((res) => {
                          updateSetting(
                            "userPasswords",
                            this.updateUserId(i, p, res.username, res.avatarURL)
                          );
                        })
                        .catch((err) => {
                          if (err) {
                            updateSetting(
                              "userPasswords",
                              this.updateUserId(
                                i,
                                p,
                                "INVALID USER",
                                "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"
                              )
                            );
                          }
                        });
                    }}
                  >
                    Set User ID
                  </TextInput>
                  <TextInput
                    defaultValue={user.password}
                    onChange={(p) => {
                      updateSetting(
                        "userPasswords",
                        this.updateUserPassword(i, p)
                      );
                    }}
                  >
                    Set User Password
                  </TextInput>

                  <Button
                    color={Button.Colors.RED}
                    onClick={() => {
                      updateSetting("userPasswords", this.removeUser(i));
                    }}
                  >
                    Remove User
                  </Button>
                </CategoryImg>
              </div>
            ))}
            <Button
              onClick={() => {
                updateSetting("userPasswords", this.addNewUser());
              }}
            >
              Add New User
            </Button>
          </Category>
        </div>
      </div>
    );
  }
};
