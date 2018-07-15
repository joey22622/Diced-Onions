//scrapes onion, posts new articles to Article collection
function scrapeOnion(){
    $.get("/api/articles", function(data){
        console.log("data" + data);
    }).then(function(data){
        location.reload();
    }).catch(function(err){
        console.log(err);
    });
}
//checks to see if there are articles displayed on the page
function countArticles(){
    var articleLength = $(".articles-section > .article-thumbnail").length;
    if(articleLength > 0){
    } else {
        var scrapeButton = $("<button class='scrape-button' type='submit'>").text("Click to scrape the Onion!")
        var message = $("<div class='scrape-message'>").text("No articles yet, click the button above to grab some!")
        $(".articles-section").append(scrapeButton, message);
    }
}
//gets width of the articles sidebar
function setWrapWidth (){
    var width = $(".articles-section").width() - 100;
    $(".text-wrap").css("width", ""+width+"px");
}

//assigns active class to clicked article, removes class from all others
function setActiveArticle(){
    const dataId = $(this).attr("data-id");
    $(".active-article").removeClass("active-article");
    $(this).addClass("active-article");
    $(".send-comment").attr("data-id", dataId);
    loadComments(dataId);
}

//get request that targets Comment collection where articleId = data id for active article
function loadComments(dataId){
    $(".posted-comment-wrap").empty();
    $("input.comment-name").val("");
    $("textarea.comment-body").val("");
    $(".inactive").removeClass("inactive");
    $(".comments-blank").addClass("inactive");
    $.get("/api/comments/" + dataId, function(data){
        console.log(data);
        for(let i = 0; i < data.length; i++){
        var newDate = moment(data[i].time).format("MM/DD/YYYY");
        const comment = $("<div class='comment-wrap'>");
        const details = $("<div class='comment-details'>");
        const name = $("<p class='comment-name'>").text(data[i].name);
        const commentDate = $("<p class='comment-date'>").text(moment(data[i].time).format("MM/DD/YY h:mm a"));
        const body = $("<p class='comment-body'>").text(data[i].body);
        details.append(name, commentDate);
        comment.append(details, body); 
        $(".posted-comment-wrap").append(comment)

    }

    }).catch(function(err){
        console.log(err);
    })
}
//posts new comment to Comment collection
function submitComment(){
    var time = new Date().getTime()
    var newComment = {
        articleId : $(this).attr("data-id"),
        name : $("input.comment-name").val().trim(),
        body : $("textarea.comment-body").val().trim(),
        time : time
    }
    var query = "api/comments/" + newComment.articleId;
    $.post(query, newComment, function(){
    }).then(function(){
        loadComments(newComment.articleId);
    }).catch(function(err){
        console.log(err);
    });

}

//click events, load events
$(".refresh-button").on("click" , scrapeOnion);
$(document).on("click", ".scrape-button" ,  scrapeOnion);
$(".article-thumbnail").on("click", setActiveArticle);
$(".send-comment").on("click", submitComment);
$(document).ready(setWrapWidth);
$(document).ready(countArticles);



