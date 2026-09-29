import { load, checkQuiz } from '../_helpers.js';

const { quiz } = await load('02-prototype/01-predict.js');
checkQuiz(quiz);
