const { React } = require("powercord/webpack");

const Lock = React.memo(() => (
    <div style={{ position:'absolute', right: 10, bottom:4 }}>
        <img src={`https://cdn-icons-png.flaticon.com/32/3064/3064130.png`}
        width='20px'
        />
    </div>
));

module.exports = {Lock}
