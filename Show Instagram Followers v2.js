// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: genderless;

let detailFontSize = 20
let statusFontSize = 10
let detailColor = Color.white();
let persistFolder = "showinstafollowers";
let fm = FileManager.iCloud();
console.log(fm);
//Get Insta Name as arg:
let account = args.widgetParameter;
if (!account)
  account = "YOUR DEFAULT ACCOUNT"

// Gets page url
let url = "https://www.instagram.com/" + account + "/";
let req = new Request(url);
let html = await req.loadString();

//Extract follower count
let followers = extractFollowers(html);

//Extract avatar
var avatar = await extractAvatarImage(html);

//update Followerstats
let stat = updateFollowerStatistics(account, followers);

let widget = createWidget(followers, avatar, stat);

Script.setWidget(widget);
widget.presentSmall();
Script.complete();

/**
 * Loads the persisted follower statistic and adds the current one. For every day, only the last value is stored, older values of the current day are replaced.
 * @param {*} accountName 
 * @returns current follower statistic. Array of objects with attribute date (time representation) and followers.
 */
function updateFollowerStatistics(account, followers) {
  var followerStatistic = loadFollowersFromFile(account);
  //Remove old values from current day
  let date = getCurrentDate();
  console.log("Array vorher: " + followerStatistic.length);
  followerStatistic = followerStatistic.filter(currentObj => currentObj.date != date.getTime());
  console.log("Array hinterher: " + followerStatistic.length);

  //add new value
  var obj = new Object();
  obj.date = date.getTime();
  obj.followers = followers;
  followerStatistic.push(obj);

  //Schreiben der Follower
  writeFollowersToFile(account, followerStatistic);
  return followerStatistic;
}

/**
 * Loads the previously persisted follower count from a file. If no file is found, an empty Array is returned.
 * @param {string} accountName -  Name of instagram account
 * @returns {Array} - the statisticsarray. Empty, if no file was found 
 */

function loadFollowersFromFile(accountName) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(dir, persistFolder + "/" + accountName + ".json");
  if (!fm.fileExists(path)) {
    console.log("NO FILE FOUND");
    return new Array();
  } else {
    console.log("FILE EXISTS");
    //fm.downloadFileFromiCloud(path); //To make sure file was already downloaded from iCloud
    var jsonString = fm.readString(path);
    console.log(jsonString);
    return JSON.parse(jsonString);
  }
}

/**
 * Persists the follower count
 * @param {*} JSON-Object to be stored 
 */
function writeFollowersToFile(accountName, followers) {
  let dir = fm.documentsDirectory();
  var path = fm.joinPath(dir, persistFolder + "/");
  if (!fm.fileExists(path)) {
    fm.createDirectory(path, false);
  }
  path += accountName + ".json";
  fm.writeString(path, JSON.stringify(followers));
}

/**
 * Returns the current date, 00:00 o'clock
 * @returns {Date} the current date
 */
function getCurrentDate() {
  let date = new Date();
  return getDate0oclock(date)
}

/**
 * Returns the date at 0 o'clock
 * @param {Date} date 
 */
function getDate0oclock(date) {
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * 
 * @param {Number} followers the current follower count
 * @param {Image} avatar 
 * @param {*} stat 
 */
function createWidget(followers, avatar, stat) {
  let widget = new ListWidget();
  widget.backgroundColor = Color.black();
  if (avatar) {
    let wimg = widget.addImage(avatar)
    wimg.centerAlignImage();
    wimg.imageSize = new Size(60, 60)
  }
  widget.addSpacer()

  let wFollowers = widget.addText(followers);
  wFollowers.font = Font.mediumRoundedSystemFont(detailFontSize)
  wFollowers.textColor = detailColor;
  wFollowers.centerAlignText();

  //Find the follower count from yesterday
  let yesterday=getTendendy(stat,followers,1);
  let week=getTendendy(stat,followers,7);
  let month=getTendendy(stat,followers,30);

  if (yesterday) {
    let wDate = widget.addText("Yesterday: " + yesterday);
    wDate.font = Font.mediumRoundedSystemFont(statusFontSize)
    wDate.textColor = detailColor;
    wDate.centerAlignText();
  }
  if (week) {
    let wDate = widget.addText("Week: " + week);
    wDate.font = Font.mediumRoundedSystemFont(statusFontSize)
    wDate.textColor = detailColor;
    wDate.centerAlignText();
  }
  if (month) {
    let wDate = widget.addText("Month: " + month);
    wDate.font = Font.mediumRoundedSystemFont(statusFontSize)
    wDate.textColor = detailColor;
    wDate.centerAlignText();
  }
  return widget;
}

/**
 * Gets the difference between followers today and followers x days ago. 
 * @param {*} days 
 * @returns (String) a String with the difference and a + oder - in front of it
 */
function getTendendy(stat, followers, days) {
  var past = new Date(new Date().setDate(new Date().getDate() - days));
  past = getDate0oclock(past);
  let objPast = stat.find(currentObj => currentObj.date == past.getTime());
  if (objPast) {
    let diff = followers - objPast.followers;
    diff = diff >= 0 ? "+" + diff : "" + diff;
    return diff;
  }else{
    return undefined;
  }

}

function extractFollowers(html) {
  let followersStart = html.indexOf('"edge_followed_by":{"count":');
  let followersEnd = html.indexOf('},"fbid"', followersStart + 1);
  let followers = html.substring(followersStart + 28, followersEnd);
  console.log("followersStart: " + followersStart)
  console.log("followersEnd: " + followersEnd)
  console.log("followers: " + followers)
  return followers;
}

async function extractAvatarImage(html) {
  let searchString = '<meta property="og:image" content="';
  let avatarStart = html.indexOf(searchString)
  let avatarURL = html.substring(avatarStart + searchString.length, html.indexOf('"', avatarStart + searchString.length))
  console.log(avatarURL);
  var avatar;
  try {
    avatar = await loadImage(avatarURL);
  } catch (e) {
    console.log("Error catching Avatar: " + e);
  }
  console.log(avatar);
  return avatar;
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
  let url = imgUrl !== null ? imgUrl : placeholder;
  let req = new Request(url)
  let image = await req.loadImage()
  return image
}
