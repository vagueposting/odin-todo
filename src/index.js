/* ====== IMPORTS ====== */
import { DataHandler } from "./data.js"
import { DisplayHandler } from "./display.js"

import './style/reset.css'; 
import './style/main.css';  
import './style/scrollbar.css'; 
import './style/checkbox.css';


const data = DataHandler();

const display = DisplayHandler(data);