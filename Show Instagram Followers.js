// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: genderless;

let detailFontSize = 36
let statusFontSize = 10
let detailColor = Color.white();

//Get Insta Name as arg:
let account = args.widgetParameter;
if (!account)
  account = "PLACE YOUR DEFAULT ACCOUNT HERE"

// Gets page url
let url = "https://www.instagram.com/" + account + "/";
let req = new Request(url);
let html = await req.loadString();

//Extract follower count
let followers = extractFollowers(html);

//Store timestamp
let date = formatDate(new Date());

//Extract avatar
var avatar=await extractAvatarImage(html);

let widget=createWidget(followers,avatar,date);

Script.setWidget(widget);
Script.complete();
widget.presentSmall();

function createWidget(followers,avatar,date){
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
  
  let wDate = widget.addText(date);
  wDate.font = Font.mediumRoundedSystemFont(statusFontSize)
  wDate.textColor = detailColor;
  wDate.centerAlignText();  
  
  return widget; 
}

function extractFollowers(html) {
  let followersStart = html.indexOf('"edge_followed_by":{"count":');
  let followersEnd = html.indexOf('},"followed_by_viewer"', followersStart + 1);
  let followers = html.substring(followersStart + 28, followersEnd);
  console.log("Followers: " + followers);
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
    console.log("Error catching Avatar: "+e);
  }
  console.log(avatar);
  return avatar;
}

// helper function to download an image from a given url
async function loadImage(imgUrl) {
  let url = imgUrl !== null ? imgUrl : placeholder;
  let req = new Request(url)
	const image = await req.loadImage()
	
	return image
}

function formatDate(timestamp) {
  let hours = timestamp.getHours();
  let minutes = timestamp.getMinutes() < 10 ? "0" + timestamp.getMinutes() : timestamp.getMinutes();
  let date = "Stand: " + hours + ":" + minutes + " Uhr";
  return date;
}
