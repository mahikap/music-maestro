
document.getElementById('test-button').onclick = () => {
    console.log("going to test");
    // Enable the test tab
    var tab = document.getElementById("test-tab");
    tab.classList.remove('disabled');
    
    // Change tabs and update indicator
    var el = document.querySelector('.tabs');
    var instance = M.Tabs.init(el, {});
    instance.select('test')
}