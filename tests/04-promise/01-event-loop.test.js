import { load, checkQuiz } from '../_helpers.js';

const { quiz } = await load('04-promise/01-event-loop.js');
checkQuiz(quiz);
