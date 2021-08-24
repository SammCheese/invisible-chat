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


module.exports = ({ msgcontent, msgpassword }) => (
  <Tooltip
    color="black"
    postion="top"
    text="This Message has Invisible Characters"
  >
    {({ onMouseLeave, onMouseEnter }) => (
      <Button
        look={Button.Looks.BLANK}
        size={Button.Sizes.ICON}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Icon
          name="LockClosed"
          className={`${buttonClasses.contents} ${buttonWrapperClasses.button} ${buttonTextAreaClasses.button}`}
          viewBox="0 1 24 24"
        />
      </Button>
    )}
  </Tooltip>
);
