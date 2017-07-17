import { combineReducers as combineReducersVanilla } from 'redux';
import Controller from './Controller';

export const __controllers = Symbol('controllers');

/**
 * Wrapper around vanilla `combineReducers()` from `redux` package.
 * Adds support for Controller class instances in place of regular reducer
 * functions. Each instance encountered is replaced with the result of
 * `Controller.reducer()` call. The instance is then saved under __controllers
 * key of the returned function. __controllers is passed up the chain and
 * is intended to be used by the `createStore()`.
 */
export default function combineReducers(reducers) {
  
  // Preprocess reducers
  const reducerKeys = Object.keys(reducers);
  const resolvedReducers = { };
  const controllers = { };
  
  for (let i = 0; i < reducerKeys.length; ++i) {
    const key = reducerKeys[i];
    const reducer = reducers[key];
    
    if (typeof reducer === 'function') {
      // Assume ready to use reducer function
      
      // Combine controllers
      if (reducer[__controllers]) {
        controllers[key] = reducer[__controllers];
      }
      
      resolvedReducers[key] = reducer;
    
    } else if (Controller.is(reducer)) {
      // Assume this is a Controller
      const controller = reducer;
      controllers[key] = controller;
      resolvedReducers[key] = controller.reducer();
      
    } else {
      // Let vanilla function to handle everything else
      resolvedReducers[key] = reducer;
    }
  }
  
  return Object.assign(combineReducersVanilla(resolvedReducers), {
    [__controllers]: Object.keys(controllers).length > 0 ?
        controllers : undefined
  });
}
