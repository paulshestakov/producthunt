const got = require("got");
const fs = require("fs").promises;
const { formatISO, format, subMonths, getYear, getMonth } = require("date-fns");

const { query } = require("./query");

const mapPost = (edge) => {
  const { node } = edge;

  const { id, comments_count, name, tagline, votes_count, topics } = node;

  return {
    id,
    comments_count,
    name,
    tagline,
    votes_count,
    topics: topics.edges.map((edge) => {
      const { node } = edge;
      const { id, slug, name } = node;

      return {
        id,
        slug,
        name,
      };
    }),
  };
};

const load = async (year, month) => {
  let edges = [];

  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const result = await got.post(
      "https://www.producthunt.com/frontend/graphql",
      {
        json: {
          query,
          variables: { year, month, day: null, cursor },
        },
        responseType: "json",
      }
    );

    edges = [...edges, ...result.body.data.posts.edges];

    hasNextPage = result.body.data.posts.pageInfo.hasNextPage;
    cursor = result.body.data.posts.pageInfo.endCursor;
  }

  return edges;
};

const loadForPeriod = async (startYear, startMonth, monthCountToLoad) => {
  try {
    await fs.mkdir("./output");
  } catch (error) {
    // Skip silently
  }

  const result = [];

  for (let i = 0; i < monthCountToLoad; i++) {
    const startDate = new Date(startYear, startMonth - 1);
    const currentDate = subMonths(startDate, i);

    const year = getYear(currentDate);
    const month = getMonth(currentDate) + 1;

    const edges = await load(year, month);

    const posts = edges
      .map(mapPost)
      .map((post) => ({
        ...post,
        timestamp: formatISO(new Date(year, month)),
      }))
      .sort((x, y) => y.votes_count - x.votes_count);

    console.log(year, month, `Count: ${posts.length}`);

    result.push(...posts);
  }

  const startDate = format(new Date(startYear, startMonth - 1), "yyyy.MM.dd");
  const endDate = format(
    subMonths(new Date(startYear, startMonth - 1), monthCountToLoad),
    "yyyy.MM.dd"
  );

  await fs.writeFile(
    `./output/${startDate}-${endDate}.json`,
    JSON.stringify(result, null, 2)
  );
};

const main = async () => {
  await loadForPeriod(2020, 6, 12);
};

main();
