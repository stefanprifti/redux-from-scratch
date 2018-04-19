/**
 * React-Redux
 * The real react-redux is at https://github.com/reactjs/react-redux
 * 
 * This is just an implementation from scratch
 * in order to understand how it works*
 */
import React, { createContext } from "react";

const Context = React.createContext();

/**
 * Provider Top-Level Component
 */
export class Provider extends React.Component {
    render() {
        return (
            <Context.Provider value={this.props.store}>
                {this.props.children}
            </Context.Provider>
        );
    }
}

/**
 * This is a simpler implementation of connect, 
 * the child component has direct access to sipatch
 * @param {function} mapStateToProps 
 */
export function connect(mapStateToProps) {
    return Component => {
        class Receiver extends React.Component {
            constructor(props) {
                super(props);
            }

            componentDidMount() {
                const { subscribe } = this.props.store;
                this.unsubscribe = subscribe(() => this.forceUpdate());
            }

            componentWillMount() {
                if (this.unsubscribe) this.unsubscribe();
            }

            render() {
                const { dispatch, getState } = this.props.store;
                const state = getState();
                const stateNeeded = mapStateToProps(state);

                return <Component {...stateNeeded} dispatch={dispatch} />;
            }
        }

        class ConnectedComponent extends React.Component {
            render() {
                return (
                    <Context.Consumer>
                        {store => {
                            return <Receiver store={store} />;
                        }}
                    </Context.Consumer>
                );
            }
        }

        return ConnectedComponent;
    };
}
