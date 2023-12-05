document.getElementById('start-button').addEventListener('click', function() {
  alert('Starting the simulation!');
  // Here you can add more JavaScript to handle what happens when the simulation starts
});

async function fetchQuestion() {
  try {
    const response = await fetch('https://g8sk9p34ve.execute-api.us-west-1.amazonaws.com/prod');
    if (!response.ok) throw new Error('Network response was not ok!');

    const data = await response.json();
    document.getElementById('question-box').textContent = data.question;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

fetchQuestion();