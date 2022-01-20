const { React } = require("powercord/webpack");

const Lock = React.memo(() => (
    <div style={{ position:'absolute', right: 10, bottom:4 }}>
        <img src={`https://image.flaticon.com/icons/png/512/3617/3617194.png`}
        width='16px'
        />
    </div>
));

module.exports = {Lock}