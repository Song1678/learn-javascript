import { load, checkQuiz } from '../_helpers.js';

const { quiz } = await load('01-this/01-predict.js');
checkQuiz(quiz);
