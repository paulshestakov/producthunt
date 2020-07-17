const query = `
query Posts($year: Int, $month: Int, $day: Int, $cursor: String) {
    posts(first: 20, year: $year, month: $month, day: $day, after: $cursor) {
      edges {
        node {
          id
          ...PostItemList
          __typename
        }
        __typename
      }
      pageInfo {
        endCursor
        hasNextPage
        __typename
      }
      __typename
    }
  }

  fragment PostItemList on Post {
    id
    ...PostItem
    __typename
  }

  fragment PostItem on Post {
    id
    _id
    comments_count
    name
    shortened_url
    slug
    tagline
    updated_at
    ...CollectButton
    ...PostThumbnail
    ...PostVoteButton
    ...TopicFollowButtonList
    __typename
  }

  fragment CollectButton on Post {
    id
    name
    isCollected
    __typename
  }

  fragment PostThumbnail on Post {
    id
    name
    thumbnail {
      id
      media_type
      ...MediaThumbnail
      __typename
    }
    ...PostStatusIcons
    __typename
  }

  fragment MediaThumbnail on Media {
    id
    image_uuid
    __typename
  }

  fragment PostStatusIcons on Post {
    name
    product_state
    __typename
  }

  fragment PostVoteButton on Post {
    _id
    id
    featured_at
    updated_at
    disabled_when_scheduled
    has_voted
    ... on Votable {
      id
      votes_count
      __typename
    }
    __typename
  }

  fragment TopicFollowButtonList on Topicable {
    id
    topics {
      edges {
        node {
          id
          ...TopicFollowButton
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment TopicFollowButton on Topic {
    id
    slug
    name
    isFollowed
    ...TopicImage
    __typename
  }

  fragment TopicImage on Topic {
    name
    image_uuid
    __typename
  }
`;

module.exports = { query };
