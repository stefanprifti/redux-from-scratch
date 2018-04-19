/**
 * Redux code
 * The real redux is at https://github.com/reactjs/redux
 *
 * This is just an implementation from scratch
 * in order to understand how it works
 */

/**
 * Create store
 *
 * Create a Redux store that holds the state tree
 * The only way to change the data in the store is to call `dispatch()` on it
 *
 * There should only be a single store in your app. To specify how different parts
 * of the state tree respond to actions you may combine several reducers
 * into a single reducer function by using `combineReducers`
 */
export function createStore(reducer, preloadedState, enhancer) {
    if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
        enhancer = preloadedState;
        preloadedState = undefined;
    }

    if (typeof enhancer !== "undefined") {
        if (typeof enhancer !== "function") {
            throw new Error("Expected the enhancer to be a function");
        }
        return enhancer(createStore)(reducer, preloadedState);
    }

    let state = reducer(undefined, {});
    let listeners = [];

    const getState = () => state;
    const subscribe = l => {
        listeners.push(l);
        return () => {
            listeners = listeners.filter(listener => listener !== l);
        };
    };

    const dispatch = action => {
        state = reducer(state, action);
        listeners.forEach(l => l());
    };

    return {
        getState,
        subscribe,
        dispatch
    };
}

/**
 * Combine reducers
 *
 * Turns an object whose values are different
 * reducer functions into a single reducer function.
 * It will call every child reducer and gather their results
 * into a single state object, whose keys correspond
 * to the keys of the passed reducer functions.
 */
export function combineReducers(reducersObject) {
    return function (state = {}, action) {
        return Object.keys(reducersObject).reduce((accReducer, reducerKey) => {
            accReducer[reducerKey] = reducersObject[reducerKey](
                state[reducerKey],
                action
            );
            return accReducer;
        }, {});
    };
}

const compose = (...funcs) => {
    if (funcs.length === 1) {
        return funcs[0];
    }

    return funcs.reduce((a, f) => (...args) => a(f(...args)));
};

/**
 * Apply middleware
 *
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks such as expressing
 * asynchronous actions in a concise manner, or logging every action payload
 */
export function applyMiddleware(...middlewares) {
    return createStore => (...args) => {
        const store = createStore(...args);

        let chain = middlewares.map(middleware => middleware(store));
        let dispatch = compose(...chain)(store.dispatch);

        return {
            ...store,
            dispatch
        };
    };
}

/**
 * Turns an object whose values are action creators into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreatores.doSomething())` yourself just fine.
 */
function bindActionCreator(actionCreator, dispatch) {
    return function () {
        return dispatch(actionCreator.apply(this, arguments));
    };
}

export function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === "function") {
        return bindActionCreator(actionCreators, dispatch);
    }

    const boundActionCreators = {};

    Object.keys(actionCreators).forEach(key => {
        var actionCreator = actionCreators[key];
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    });

    return boundActionCreators;
}