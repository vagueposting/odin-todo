/* ====== IMPORTS ====== */
import { DataHandler } from "./data.js"
import { DisplayHandler } from "./display.js"
import { StateHandler } from "./state.js"

import './style/reset.css'; 
import './style/main.css';  
import './style/scrollbar.css'; 
import './style/checkbox.css';

const state = StateHandler();
const data = DataHandler(state);
console.table(data.viewList());

DisplayHandler(data, state); 