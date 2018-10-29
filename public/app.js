// Grab the articles as a json
$(document).ready(function () {
  $.getJSON("/articles", function (data) {
    // For each one
    console.log("getJSON");
    console.log(data);
    for (var i = 0; i < data.length; i++) {
      // Display the articles on the page
      $("#articles").append(
        ` <div id="article-${data[i]._id}" class="container-fluid article-container">
      <div class="card">
          <div class="card-header">
              <a href="http:${data[i].link}">${data[i].link}</a>
          </div>
          <div id='modalId' data-id=${data[i]._id} class="card-body">
              <h5 class="card-title">${data[i].title}</h5>
              <p class="card-text">${data[i].summary}</p>
              <button type="button"id="add" data-id=${data[i]._id} class="btn btn-primary" data-target="#exampleModalCenter">
              Add Note
            </button>
              </div>
      </div>
  </div>`);

    }
  });
});


$(document).on("click", "#scrapeBtn", function (event) {
  event.preventDefault();
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .then(function () {
      window.location.reload();
    })
});

// Whenever someone clicks a p tag
$(document).on("click", "#add", function (event) {
  event.preventDefault();
  // Empty the notes from the note section
  $("#notes").empty();
  $("#modalTitle").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })

    .then(function (data) {
      console.log("this is the data title " + data.title);
      // The title of the article

      $("#notes").append(
        `<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">${data.title}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
              <div class="form-group">
                  <label for="note">Enter Note</label>
                  <textarea type="text" class="form-control" id="note" rows="3" val=${data.note}></textarea>
              </div>  
       
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="save" data-id=${data.id} data-dismiss="modal">Save Note</button>
      </div>
    </div>
  </div>
</div>`
      );
      $('.modal').modal('show');

    });


    // With that done, add the note information to the page
    // .then(function (data) {
    //   console.log(data);
    //   // The title of the article
      // $("#notes").append("<h2>" + data.title + "</h2>");
    //   // An input to enter a new title
      // $("#notes").append("<input id='titleinput' name='title' >");
    //   // A textarea to add a new note body
      // $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
    //   // A button to submit a new note, with the id of the article saved to it
      // $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      // if (data.note) {
      //   // Place the title of the note in the title input
      //   $("#titleinput").val(data.note.title);
      //   // Place the body of the note in the body textarea
      //   $("#bodyinput").val(data.note.body);
      // }
    // });

  });
// When you click the savenote button
$(document).on("click", "#save", function () {
    // Grab the id associated with the article from the submit button

    var thisId = $("#modalId").attr("data-id");
    var title = $("#modalTitle").text();
    var body = $("#note").val();
    console.log("Onclisk save note" + thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: title,
        // Value taken from note textarea
        body: body
      }
    })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  });


