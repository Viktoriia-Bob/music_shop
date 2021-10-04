let url = 'http://localhost:3000/songs';
fetch(url)
  .then((response) => response.json())
  .then((result) => {
    let list = document.getElementById('songs');

    for (let i = 0; i < result.length; i++) {
      const div = document.createElement('div');
      div.setAttribute('class', 'container');
      const text = result[i];

      div.innerHTML = `<img src="${text.image}" alt="Avatar" style="width:90px">
            <p><span>${text.name}.</span> ${text.author}.</p>
            <p>${text.genre}.</p><p>${text.price}&#162</p>`;

      list.appendChild(div);
    }
  })
  .catch((error) => console.log('error:', error));
