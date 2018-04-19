import React, { createContext } from "react";

const Context = React.createContext();

export class Provider extends React.Component {
    render() {
        return (
            <Context.Provider value={this.props.store}>
                {this.props.children}
            </Context.Provider>
        );
    }
}

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
                            {
                                console.log("store 2", store);
                            }
                            return <Receiver store={store} />;
                        }}
                    </Context.Consumer>
                );
            }
        }

        return ConnectedComponent;
    };
}
