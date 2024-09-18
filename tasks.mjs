
/**
 * @module tasks
 * 
 * Task contains task related methods and structures.
 */

/**
 * A simple task contains task name and
 * @typedef {Object} SimpleTask
 * @property {Readonly<string>} name The name of the task.
 * @property {Readonly<boolean>} done Has the task completed.
 */

/**
 * A task, whose status can be changed.
 * @typedef {Object} MutableTask
 * @property {Readonly<string>} name The name of the task.
 * @property {boolean} done Has the task compelted.
 */

/**
 * Create a new todo.
 * @param {string} name The name of the todo. 
 * @param {boolean} [done=false] The status of the task. Defaults to false.
 * @returns {SimpleTask} The created simple todo.
 */
export function createSimpleTask(name, done=false) {
    return {
        name,
        done: done == true
    };
}

/**
 * Linked todo joining several tasks.
 * 
 * @typedef {Object} LinkedTask
 * @property {string} name The name of the linked todo.
 * @property {Task[]} [completedBy=[]] The todos determining the completion.
 * @property {Readonly<boolean>} partial Is the todo partially completed.
 * @property {Readonly<boolean|undefined>} done Is the todo completed. An undefined value
 * indicates the todo is impartial - between all tasks completed and no task completed. 
 */

/**
 * A task, which may be blocked.
 * @typedef {Object} Blockable
 * @property {Task[]} [blockedBy=[]] The prohibited todos preventing the completion.
 * @property {Readonly<boolean>} blocked Is the completion prohibited due complete blocked task.
 */

/**
 * A task which is both linked and blcokable.
 * @typedef {LinkedTask & Blockable} BlockableLinkedTask
 */

/**
 * Createa linked task.
 * 
 * @param {string} name The name of the linked task.
 * @param {Task[]} [members=[]] The members of the linked task.
 * @param {Predicate<Task[]>} [completionFn] The funciton testing whether the members fulfil the task.
 * Defaults to the all members are completed.
 * @returns {LinkedTask} The create dlinked task.
 */
export function createLinkedTask(name, members = [], completionFn = (members) => (members.every( task => task.done))) {
    const result = /** @type {LinkedTask} */ {
        get name() {
            return name;
        },

        get completedBy() {
            return members;
        },

        get done() {
            return completionFn(this.completedBy);
        },

        get partial() {
            return this.completedBy.some( task => task.done) && !this.done;
        }
    };
    return Promise.resolve(result);
}

/**
 * Create a task requiring all tasks are completed.
 * 
 * @param {string} name The name of the taks.
 * @param {...Task} [completedBy=[]] The list of tasks required to complee the task.
 * @returns {LinkedTask} A linked task completed when all tasks are completed.
 */
export function createCompleteAllTask(name, completedBy = []) {
    return createLinkedTask(name, completedBy);
}

/**
 * Create a task requiring any task to completed.
 * 
 * @param {string} name The name of the taks.
 * @param {...Task} [completedBy=[]] The list of tasks required to complee the task.
 * @returns {LinkedTask} A linked task completed when any task are completed.
 */
export function createCompleteAnyTask(name, completedBy = []) {
    return createLinkedTask(name, completedBy, (members) => (members.some( task => task.done)));
}

/**
 * Get todo requiring all todos to complete.
 * 
 * @param {Readonly<string>} name The name of the todo. 
 * @param {Readonly<Task[]>} [completedBy=[]] The list of tasks, which has to be all completed.
 * @param {Readonly<Task[]>} [blockedBy=[]] The list of tasks, which all has to be incompleted.
 * @returns {BlockableLinkedTask} a task completed when all of the require tasks are finished, and
 * blocked, when any of the prohibted tasks is completed.
 */
export function createCompleteAllStepsBlockingTask(name, completedBy = [], blockedBy = []) {
    return /** @type {BlockableLinkedTask} */ {
        get name() {
            return name;
        },
        get completedBy() {
            return completedBy;
        },
        get blockedBy() {
            return blockedBy;
        },
        get blocked() {
            return blockedBy.length > 0 && blockedBy.anyMatch(prohibited => (prohibited.done));
        },
        get done() {
            if (this.prohibited) {
                return false;
            } else {
                const completed = this.completedBy.reduce( (result, todo) => (
                    result + (todo.done ? 1 : 0)
                ), 0);
                return completed === this.completedBy.length ? true : undefined;
            }
        },
        get partial() {
            return this.done === undefined;
        }
    };
}

/**
 * The type of tasks.
 * @typedef {SimpleTask|LinkedTask|MutableTask} Task
 */
