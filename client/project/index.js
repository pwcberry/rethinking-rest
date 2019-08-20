const fullStar = "★";
const emptyStar = "☆";

const commitFragment = `
fragment commitFragment on Repository {
  ref(qualifiedName: "master") {
    target {
      ... on Commit {
        history {
          totalCount
        }
      }
    }
  }
}
`;

let queryRepoList = `
{
  viewer {
    name
    repos:repositories(first:20, orderBy:{ field: UPDATED_AT, direction:DESC }) {
      totalCount
      nodes {
        name
        url
        updatedAt
        ...commitFragment
      }
    }
  }
}

${commitFragment}
`;

let mutationAddStar;

let mutationRemoveStar;

function gqlRequest(query, variables, onSuccess) {
  // MAKE GRAPHQL REQUEST
  $.post({
    url: "https://api.github.com/graphql",
    contentType: "application/json",
    headers: {
      Authorization: "bearer 57108de1e9fddd8e3204c15d6350d649aa6a4673",
      // Authorization: "token 27dc55fca8ddf1fbb71c819fa43d72145398825a"
    },
    data: JSON.stringify({
      query,
      variables,
    }),
    success: (response) => {
      const {
        data
      } = response;
      if (data) {
        onSuccess(data);
      }
    },
    error: (error) => console.error(error)
  });
}

function starHandler(element) {
  // STAR OR UNSTAR REPO BASED ON ELEMENT STATE

}

$(window).ready(function () {
  // GET NAME AND REPOSITORIES FOR VIEWER
  gqlRequest(queryRepoList, {}, (data) => {
    $("header h2").text(data.viewer.name);
    const {
      repos
    } = data.viewer;

    if (repos.totalCount > 0) {
      const container = $(".repos");
      container.empty();
      repos.nodes.forEach(node => {
        container.append(`<article class="repo">
          <h3>${node.name}</h3>
          <p>${node.ref.target.history.totalCount} commits</p>
        </li>`);
      });
    }
  })
});