export default class GUI {
    /** @type {Array<function(HTMLElement | null)>} **/
    static tasks = [];
    static childTasks = [];
    static getHTML() {
        let res = function(resolve) {
            let canvas = document.getElementById("canvas");
            if (canvas)
                resolve(canvas);
            setTimeout(res, 1, resolve);
        }
        return new Promise(res);
    }

    static hook(task) {
        GUI.tasks.push(task);
    }

    static hookChild(childType, events, extra, br = false) {
        GUI.hook(canvas => {
            let child = document.createElement(childType);
            for (let event in events)
                child.addEventListener(event, events[event]);
            canvas.appendChild(child);
            extra(child);
            if (br)
                canvas.appendChild(document.createElement("br"));
        });
    }

    static async clear() {
        (await GUI.getHTML()).innerHTML = "";
    }

    static async draw() {
        GUI.clear();
        let canvas = await GUI.getHTML();
        for (let task of GUI.tasks)
            task(canvas);
    }
}