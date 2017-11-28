import React from 'react';
import ReactDOM from 'react-dom';
import Cashflow from './cashflow';
import { SINGLE, JOINT } from './data';

const userBirthday = "1987-09-18";
const spouseBirthday = "1980-02-17";

document.addEventListener("DOMContentLoaded", () => {
	const root = document.getElementById("root");
	ReactDOM.render(<Cashflow
										cashflow={ SINGLE }
										joint={ false }
										userBirthday={ userBirthday }
										spouseBirthday={ spouseBirthday }
										/>, root);
});
