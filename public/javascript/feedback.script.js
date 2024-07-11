document.title = "Feedback";

function commentCreated() {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#submitform");
    const mainDiv = document.querySelector("#user-comment-section");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const comment = data.get("comment");
      if (comment === "") {
        return;
      }
      console.log("Submitting comment: " + comment);

      try {
        const response = await axios.post(
          "https://coin-tracker-lilac.vercel.app/user/createcomment",
          { comment: comment }
        );

        const fetchedData = response.data;
      
        if(fetchedData.data.createdComment.user == fetchedData.data.user?._id){
          console.log("Same user means edit and delete");
        }else{
          console.log("Reply on comment");
        }

        const confirmedCommentDivHTML = `
        <div class="commentdiv flex flex-col w-full md:w-3/4 mt-6 md:mt-10 mb-10" data-commentid="${fetchedData.data.createdComment._id}">
          <div class="grid gap-20 comment">
            <div class="border-b border-zinc-700 pb-4 mb-4">
              <div class="content">
                <div class="flex justify-between items-center gap-4">
                  <div class="flex gap-4">
                    <div class="h-12 w-12 avatar">
                      <img src="${fetchedData.data.createdComment.avatar}" class="max-w-full rounded-full" />
                    </div>
                    <div>
                      <h5 class="font-medium" style="font-family: Inter">${fetchedData.data.user.username}</h5>
                      <span class="text-xs uppercase text-gray-400" style="font-family: Inter">
                        ${new Date(fetchedData.data.createdComment.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div class="relative dropdownDiv">
                    <button class="dropdownButton text-gray-400 hover:text-gray-600">
                      <i class="pointer-events-none ri-more-2-fill"></i>
                    </button>
                    <div class="dropdownMenu absolute right-0 hidden mt-2 w-32 bg-black rounded-md shadow-lg">
                      
                      <button class="delete w-full text-left px-4 py-2 text-sm text-gray hover:bg-[#1f1f1e]">Delete</button>
                    </div>
                  </div>
                </div>
                <div class="content-comment ml-16">
                  <p class="mt-3 md:mt-4 text-sm md:text-base" style="font-family: Inter">${fetchedData.data.createdComment.comment}</p>
                </div>
                <div class="flex justify-between mt-4 ml-16">
                  <div class="flex items-center gap-2">
                    <button class="ratebtn flex items-center justify-center border border-gray-300 rounded-full w-8 h-8 hover:border-gray-500">
                      <i class="ri-thumb-up-fill text-[#FDCD55] pointer-events-none"></i>
                    </button>
                    <div class="value font-medium text-sm leading-5 text-center text-green-600">${fetchedData.data.createdComment.rate.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

        mainDiv.insertAdjacentHTML("afterbegin", confirmedCommentDivHTML);

        form.reset();
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
};

function rating() {
  let maincommentDiv = document.querySelector("#founder-and-user-comment-section");

  maincommentDiv.addEventListener("click", async function (e) {
    if (e.target.classList.contains("ratebtn")) {
      let commentdiv = e.target.closest(".commentdiv");

      let commentid = commentdiv.getAttribute("data-commentid");

      let response = await axios.post(
        `https://coin-tracker-lilac.vercel.app/user/rating/${commentid}`
      );
      let ratenumber = response.data.data.comment.rate;
      console.log(response.data);

      commentdiv.querySelector(".value").innerHTML = ratenumber.length;
    }
  });
};

function deleteComment() {
  let maincommentDiv = document.querySelector("#founder-and-user-comment-section");

  maincommentDiv.addEventListener("click", async function (e) {
    if (e.target.classList.contains("dropdownButton")) {
      let dropdownDiv = e.target.parentElement;
      let menu = dropdownDiv.querySelector(".dropdownMenu");

      // Close all other open dropdown menus
      document.querySelectorAll(".dropdownMenu").forEach(m => {
        if (m !== menu) {
          m.classList.add("hidden");
          m.classList.remove("opacity-100");
          m.classList.add("opacity-0");
        }
      });

      menu.classList.toggle("hidden");
      if (!menu.classList.contains("hidden")) {
        menu.classList.remove("opacity-0");
        menu.classList.add("opacity-100");
      } else {
        menu.classList.remove("opacity-100");
        menu.classList.add("opacity-0");
      }
      e.stopPropagation();
    } 
    else if (e.target.classList.contains("delete")) {
      let commentdiv = e.target.closest(".commentdiv");
      let commentid = commentdiv.getAttribute("data-commentid");

      let response = await axios.delete(
        `https://coin-tracker-lilac.vercel.app/user/deletecomment/${commentid}`
      );
      
      let data = await response.data.data;
      console.log(data);
      
      commentdiv.remove();
    }else if (e.target.classList.contains("reply")) {
      let commentInput = document.getElementById('comment-input');
      if (commentInput) {
        commentInput.focus(); // Focus on the comment input field
      }

      // Close the dropdown menu after the reply action
      let menu = e.target.closest(".dropdownMenu");
      if (menu) {
        menu.classList.add("hidden");
        menu.classList.remove("opacity-100");
        menu.classList.add("opacity-0");
      }
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    let menus = document.querySelectorAll(".dropdownMenu");
    menus.forEach((menu) => {
      let dropdownDiv = menu.parentElement;
      let button = dropdownDiv.querySelector(".dropdownButton");

      if (!button.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add("hidden");
        menu.classList.remove("opacity-100");
        menu.classList.add("opacity-0");
      }
    });
  });
}

deleteComment();
commentCreated();
rating();
