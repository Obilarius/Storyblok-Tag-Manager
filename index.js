import StoryblokClient from 'storyblok-js-client';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

const argv = yargs(hideBin(process.argv))
  .option('slug', {
    alias: 's',
    type: 'string',
    description: 'Kommagetrennte Slugs, nach dennen gesucht werden soll. Wildcard ist mit * möglich. z.b. --slug "pages/eins,pages/zwei" --slug "de-de/*"',
    demandOption: true,
  })
  .option('tag', {
    alias: 't',
    type: 'string',
    description: 'Das Tag, das hinzugefügt werden soll',
    demandOption: false,
  })
  .option('alternates', {
    alias: 'a',
    type: 'boolean',
    description: 'Alternativen Seiten in anderen Locales einbeziehen',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .argv;

const Storyblok = new StoryblokClient({
  oauthToken: 'INSERT STORYBLOK OAUTH TOKEN'
});

const spaceId = 'INSERT SPACE ID';

const searchSlug = argv.slug;
const newTag = argv.tag;
const alternates = argv.alternates;

const getStoryById = async (id) => {
  try {
    const response = await Storyblok.get(`spaces/${spaceId}/stories/${id}`);
    return response.data.story;
  } catch (error) {
    console.error('Fehler beim Abrufen der Story:', error);
  }
}

const searchStorysBySlug = async (slug) => {
  try {
    let page = 1;
    let stories = [];
    let response;

    do {
      response = await Storyblok.get(`spaces/${spaceId}/stories`, {
        by_slugs: slug,
        per_page: 25,
        page: page,
        story_only: true
      });

      stories = stories.concat(response.data.stories);
      page++;
    } while (response.data.stories.length > 0);
  
    return stories;

  } catch (error) {
    console.error('Fehler bei der Suche nach Seiten:', error);
    return [];
  }
}

const addTagToStories = async (stories, tag) => {
  try {
    stories.forEach(async story => {
      const currentTags = story.tag_list;
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);

        await Storyblok.put(`spaces/${spaceId}/stories/${story.id}`, {
          story: {
            tag_list: currentTags
          }
        });

        console.log(`Tag "${tag}" hinzugefügt zu: ${story.full_slug}`);
      }
    });
  } catch (error) {
    console.error('Fehler beim Tag hinzufügen der Story:', error);
  }
}

const main = async () => {
  const stories = await searchStorysBySlug(searchSlug);

  if (stories.length === 0) {
    console.log('Keine Stories gefunden.');
    return;
  }

  stories.forEach(story => {
    console.log('Story gefunden:', story.full_slug);
  });

  let alternateStories = [];
  if (alternates) {
    for (const story of stories) {
      const detailedStory = await getStoryById(story.id);
      alternateStories = alternateStories.concat(detailedStory.alternates);
    }
  
    alternateStories.forEach(story => {
      console.log('Alternate gefunden:', story.full_slug);
    });
  }

  if (newTag) {
    const { confirmAddTag } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmAddTag',
        message: `Möchten Sie das Tag "${newTag}" zu allen gefundenen Stories hinzufügen?`,
        default: false
      }
    ]);

    if (confirmAddTag) {
      const detailedAlternateStories = [];
      for (const altStory of alternateStories) {
        const detailedStory = await getStoryById(altStory.id);
        if (detailedStory) {
          detailedAlternateStories.push(detailedStory);
        }
      }

      const allStories = stories.concat(detailedAlternateStories);

      await addTagToStories(allStories, newTag);
    }
  }
}
main();
