//----Generate Word Cloud

let data = [];

Object.keys(wordfrontmap).forEach(function(key){
    data.push({letter: key, frequency: wordfrontmap[key]})
});

// Set the width and height for word cloud
var width = 750, height = 700;
var fill = d3.scale.category20();

// Filtering each word into word cloud
var leaders = [];
data.forEach(function(row){
    if (row.frequency > 0) leaders.push({text: row.letter, size: Number(row.frequency)});
});

// Chuck 100 words into cluster of word cloud
var leaders = leaders.sort(function(a,b){
    return (a.size < b.size)? 1:(a.size == b.size)? 0:-1
}).slice(0,100);

var leaderScale = d3.scale.linear()
    .range([10,60])
    .domain([d3.min(leaders,function(d) { return d.size; }),
        d3.max(leaders,function(d) { return d.size; })
    ]);

d3.layout.cloud().size([width, height])
    .words(leaders)
    .padding(8)
    .font("Impact")
    .fontSize(function(d) { return leaderScale(d.size); })
    .on("end", drawCloud)
    .start();

// Draw the word cloud
function drawCloud(words) {
    d3.select("#word-cloud").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) {
            return d.size + 5 + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function (d, i) {
            return fill(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
            return d.text;
        });
}
