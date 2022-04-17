// Some attribution to https://github.com/Sidemen19/send-button
const {
  React,
  getModuleByDisplayName,
  getModule,
} = require("powercord/webpack");

const Tooltip = getModuleByDisplayName("Tooltip", false);
const { Button, Icon } = require("powercord/components");
const buttonClasses = getModule(["button"], false);
const buttonWrapperClasses = getModule(["buttonWrapper", "pulseButton"], false);
const buttonTextAreaClasses = getModule(["button", "textArea"], false);
module.exports = class InvisibleChatButton extends React.Component {
constructor(props) {
  super(props);
}

render() {
  return (
    <Tooltip color="black" postion="top"
    text={'Create Hidden Message'}>
      {({ onMouseLeave, onMouseEnter }) => (
          <Button
              style={{ marginTop: 1 }}
              look={Button.Looks.BLANK}
              size={Button.Sizes.ICON}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
          >
              <Icon
                  id={'invisiblechat-button-bar'}
                  name="LockClosed"
                  className={`${buttonClasses.contents} ${buttonWrapperClasses.button} ${buttonTextAreaClasses.button}`}
              />
          </Button>
      )}
  </Tooltip>
  )
}
}
