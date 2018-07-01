function scrapeOnion(){
    $.get("/api/articles", function(data){
        console.log("data" + data);
    }).then(function(data){
        location.reload();
    }).catch(function(err){
        console.log(err);
    });
}

function setWrapWidth (){
    var width = $(".articles-section").width() - 100;
    console.log(width);

    $(".text-wrap").css("width", ""+width+"px");
}
function setActiveArticle(){
    const dataId = $(this).attr("data-id");
    $(".active-article").removeClass("active-article");
    $(this).addClass("active-article");
    $(".send-comment").attr("data-id", dataId);

    console.log(dataId);

    loadComments(dataId);
}

function loadComments(dataId){
    $(".inactive").removeClass("inactive");
    $(".comments-blank").addClass("inactive");
    $.get("/api/comments/" + dataId, function(data){
    }).catch(function(err){
        console.log(err);
    })
}

function submitComment(){
    var newComment = {
        articleId : $(this).attr("data-id"),
        name : $(".comment-name").val(),
        body : $(".comment-body").val()
    }
    var query = "api/comments/" + newComment.articleId;
    $.post(query, newComment, function(){
    }).catch(function(err){
        console.log(err);
    });

}


$(".refresh-button").on("click" , scrapeOnion);
$(".article-thumbnail").on("click", setActiveArticle);
$(".send-comment").on("click", submitComment);
$(document).ready(setWrapWidth);


