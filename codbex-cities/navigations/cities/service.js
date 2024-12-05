const navigationData = {
    id: 'cities-navigation',
    label: "Cities",
    group: "metadata",
    order: 500,
    link: "/services/web/codbex-cities/gen/codbex-cities/ui/Cities/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }