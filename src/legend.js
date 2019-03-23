export default class Legend {

    constructor(nodeIdLegend, data, onToggle) {
        this.nodeIdLegend = nodeIdLegend;
        let styleEl = document.createElement('style');
        document.head.appendChild(styleEl);
        let styleSheet = styleEl.sheet;
        for (let key in data.names) {
            let name = document.createElement('label');
            name.id = nodeIdLegend + '-' + key;
            name.classList.add('legendItem');
            name.innerHTML = data.names[key] + '<input type="checkbox" checked="checked"><span class="checkmark noInvertColor"></span>' ;
            document.getElementById(this.nodeIdLegend).appendChild(name);
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + '.legendItem input:checked ~ .checkmark { background-color: ' + data.colors[key] + ' }')
            styleSheet.insertRule('#' + nodeIdLegend + '-' + key + ' > .checkmark { color: ' + data.colors[key] + '}')
            document.querySelector('#' + nodeIdLegend + '-' + key).onchange=onToggle(key);
        }
    }

}
