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
      Authorization: "bearer d0de2af81acaec925daa36ac2520395324c8f606"
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
          <h3><a href="${node.url}" target="_blank" rel="noreferrer">${node.name}</a></h3>
          <p>Last updated: ${dateFns.format(node.updatedAt, 'D MMM YYYY, h:mm a')}</p>
          <p>${node.ref.target.history.totalCount} commits</p>
        </li>`);
      });
    }
  })
});