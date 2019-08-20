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
        id
        isPrivate
        viewerHasStarred
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

let mutationAddStar = `
mutation ($id: ID!) {
  addStar(input: { starrableId: $id}){
    starrable {
      ...on Repository {
        name
        viewerHasStarred
      }
    }
  }
}
`;

let mutationRemoveStar = `
mutation ($id: ID!) {
  removeStar(input: { starrableId: $id}){
    starrable {
      ...on Repository {
        name
        viewerHasStarred
      }
    }
  }
}
`;

function gqlRequest(query, variables, onSuccess) {
  $.post({
    url: "https://api.github.com/graphql",
    contentType: "application/json",
    headers: {
      Authorization: "bearer 053bc21a2a4cbadf4cf3da1d21158a03fa5b9e9c"
    },
    data: JSON.stringify({
      query,
      variables,
    }),
    success: (response) => {
      const {
        data, errors
      } = response;

      if (!errors && data) {
        onSuccess(data);
      } else if (errors) {
        console.error(errors);
      }
    },
    error: (error) => console.error(error)
  });
}

function starHandler(event) {
  const element = $(event.target);
  if (element.hasClass("star")) {
      const parent = element.parent();
      const hasStarred = parent.data('has-star');
      const id = parent.data('id');

      const onSuccess = (response) => {
        const { viewerHasStarred } = hasStarred ? response.removeStar.starrable : response.addStar.starrable;
        element.text(viewerHasStarred ? fullStar : emptyStar);
        parent.data('has-star', viewerHasStarred);
      };
      
      const query = hasStarred ? mutationRemoveStar : mutationAddStar;
      gqlRequest(query, { id }, onSuccess);
  }
}

$(window).ready(function () {
  gqlRequest(queryRepoList, {}, (data) => {
    $("header h2").text(data.viewer.name);
    const {
      repos
    } = data.viewer;

    if (repos.totalCount > 0) {
      const container = $(".repos");
      container.empty();
      repos.nodes.forEach(node => {
        const star = node.viewerHasStarred ? fullStar : emptyStar;
        const element = $(`<article class="repo">
          <h3><a href="${node.url}" target="_blank" rel="noreferrer">${node.name}</a></h3>
          <span class="star">${star}</span>
          <p>Last updated: ${dateFns.format(node.updatedAt, 'D MMM YYYY, h:mm a')}</p>
          <p>${node.ref.target.history.totalCount} commits</p>
        </article>`).on('click', starHandler).data({
          'has-star': node.viewerHasStarred,
          'id': node.id
        });
        container.append(element);
      });
    }
  })
});