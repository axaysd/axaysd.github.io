// script.js
document.addEventListener('DOMContentLoaded', function() {
  fetchQuestion();
});

async function fetchQuestion() {
  try {
    const response = await fetch('https://g8sk9p34ve.execute-api.us-west-1.amazonaws.com/prod/questions');
    if (!response.ok) throw new Error('Network response was not ok !!');

    const data = await response.json();
    const questionBox = document.getElementById('question-box');
    questionBox.innerHTML = `<p>Question::: ${data} ${data.question}</p>`;
  } catch (error) {
    console.error('There has been a problem with your fetch operation::', error);
  }
}
