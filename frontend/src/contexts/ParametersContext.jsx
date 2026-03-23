import { createContext, useContext, useMemo } from "react";
import useParameters from "../hooks/useParameters";

const ParametersContext = createContext(null);

/**
 * Provides parameters, categories, and visualizations to the component tree.
 * @param {{ children: React.ReactNode }} props
 */
export const ParametersProvider = ({ children }) => {
    const paramData = useParameters();

    return (
        <ParametersContext.Provider value={paramData}>
            {children}
        </ParametersContext.Provider>
    );
};

const useParametersContext = () => {
    const ctx = useContext(ParametersContext);
    if (!ctx) {
        throw new Error(
            "useParametersContext must be used within a ParametersProvider",
        );
    }
    return ctx;
};

/**
 * Returns the full list of parameter objects.
 * @returns {Array}
 */
export const useParametersList = () => {
    const { parameters } = useParametersContext();
    return parameters;
};

/**
 * Returns a map of parameter name (id) -> display title.
 * @returns {{ [name: string]: string }}
 */
export const useParamNames = () => {
    const { parameters } = useParametersContext();
    return useMemo(
        () =>
            parameters.reduce((acc, p) => {
                acc[p.name] = p.title || p.name;
                return acc;
            }, {}),
        [parameters],
    );
};

/**
 * Returns a map of parameter name (id) -> unit string.
 * @returns {{ [name: string]: string }}
 */
export const useParamUnits = () => {
    const { parameters } = useParametersContext();
    return useMemo(
        () =>
            parameters.reduce((acc, p) => {
                acc[p.name] = p.unit || "";
                return acc;
            }, {}),
        [parameters],
    );
};
