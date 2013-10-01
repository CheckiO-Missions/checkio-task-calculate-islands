//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            var eCanvas = new CalculateIslandsCanvas();
            eCanvas.createCanvas($content.find(".explanation")[0], checkioInput);
            eCanvas.animateCanvas(explanation);

            this_e.setAnimationHeight($content.height() + 60);

        });

        var $tryit;
        var tooltip = false;
//
        ext.set_console_process_ret(function (this_e, ret) {
            $tryit.find(".checkio-result-in").html("<br>" + ret);
        });

        ext.set_generate_animation_panel(function (this_e) {

            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));

            $tryit.find(".tryit-canvas").mouseenter(function(e) {
                if (tooltip) {
                    return false;
                }
                var $tooltip = $tryit.find(".tryit-canvas .tooltip");
                $tooltip.fadeIn(1000);
                setTimeout(function() {
                    $tooltip.fadeOut(1000);
                }, 2000);
                tooltip = true;
            });

            var tCanvas = new CalculateIslandsCanvas();
            tCanvas.createCanvas($tryit.find(".tryit-canvas")[0],
                [
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 1, 1, 0, 0],
                    [0, 0, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0]
                ]
            );
            tCanvas.createFeedback();
            $tryit.find('.bn-check').click(function (e) {
                var data = tCanvas.getField();
                this_e.sendToConsoleCheckiO(data);
                e.stopPropagation();
                return false;
            });

        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#9D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";

        function CalculateIslandsCanvas() {

            var zx = 10;
            var zy = 10;
            var cellSize = 40;

            var cellN = [0, 0];
            var fullSize = [0, 0];

            var delay = 300;
            var stepDelay = delay * 1.5;


            var colorDark = "#294270";
            var colorGrey = "#B2B3B3";
            var colorBlue = "#82D1F5";
            var colorDarkBlue = "#6BA3CF";
            var colorOrange = "#FABA00";
            var colorDarkOrange = "#FA8F00";

            var attrRect = {"stroke-width": 2, "stroke": colorGrey};
            var attrWater = {"fill": colorBlue};
            var attrLand = {"fill": colorOrange};
            var attrNumber = {"font-size": cellSize * 0.6,
                "font-family": "Verdana",
                "stroke": colorDark};
            var attrWave = {"stroke": colorDarkBlue, "stroke-width": 1};
            var attrHill = {"stroke": colorDarkOrange, "stroke-width": 1};
            var paper;
            var rectSet;
            var inField = [];

            var waveString = "M0.5,5.5 C0.5,2.739 2.739,0.5 5.5,0.5 M5.5,0.5 C5.5,3.261 7.739,5.5 10.5,5.5 M15.5,0.5 C12.739,0.5 10.5,2.739 10.5,5.5 M15.5,0.5 C15.5,3.261 17.739,5.5 20.5,5.5 M25.5,0.5 C22.739,0.5 20.5,2.739 20.5,5.5 M25.5,0.5 C25.5,3.261 27.739,5.5 30.5,5.5";
            var hillString = "M20.5,6.274 C10.5,-3.726 5.5,1.274 0.5,6.274";


            var createCompPath = function(p, cPath, vsize, x, y) {

                var c = p.path(cPath);
                c.transform("t" + x + "," + y);
                c.transform("...s" + (vsize / 10));
                return c;
            };

            var createRectCell = function(p, isLand, row, col) {
                var tempSet = p.set();
                tempSet.push(p.rect(
                    zx + cellSize * col,
                    zy + cellSize * row,
                    cellSize,
                    cellSize
                ).attr(attrRect).attr(isLand ? attrLand : attrWater));
                if (isLand){
                    tempSet.push(createCompPath(p,
                        hillString,
                        cellSize / 6,
                        zx + cellSize / 15 + cellSize * col,
                        zy + cellSize / 5 + cellSize * row).attr(attrHill));
                    tempSet.push(createCompPath(p,
                        hillString,
                        cellSize / 6,
                        zx + 3 * cellSize / 8 + cellSize * col,
                        zy + 3 * cellSize / 5 + cellSize * row).attr(attrHill));
                }
                else {
                    tempSet.push(createCompPath(p,
                        waveString,
                        cellSize / 6,
                        zx + cellSize / 20 + cellSize * col,
                        zy + cellSize / 5 + cellSize * row).attr(attrWave));
                    tempSet.push(createCompPath(p,
                        waveString,
                        cellSize / 6,
                        zx + cellSize / 20 + cellSize / 8 + cellSize * col,
                        zy + 3 * cellSize / 5 + cellSize * row).attr(attrWave));
                }
                for (var i = 0; i < 3; i++){
                    tempSet[i].row = row;
                    tempSet[i].col = col;
                }
                return tempSet;
            };

            this.createCanvas = function(dom, field) {
                for (var c = 0; c < field.length; c++){
                    inField.push(field[c].slice(0, field[c].length));
                }
                cellN = [field[0].length, field.length];
                fullSize = [cellN[0] * cellSize + zx * 2, cellN[1] * cellSize + zy * 2];
                paper = Raphael(dom, fullSize[0], fullSize[1], 0, 0);
                rectSet = paper.set();
                for (var row = 0; row < field.length; row++){
                    for (var col = 0; col < field[0].length; col++){
                        rectSet.push(createRectCell(paper, Boolean(field[row][col]), row, col));
                    }

                }
            };

            this.animateCanvas = function(expl) {
                var i = 0;
                var sInt = setInterval(function(){
                    if (i >= expl.length){
                        clearInterval(sInt);
                        return false;
                    }
                    var t = expl[i][0];
                    var row = expl[i][1];
                    var col = expl[i][2];
                    var number = paper.text(
                        zx + cellSize / 2 + cellSize * col,
                        zy + cellSize / 2 + cellSize * row,
                        t
                    ).attr(attrNumber).attr("opacity", 0);
                    number.animate({"opacity": 1}, delay);
                    i++;
                }, stepDelay);
            };

            this.createFeedback = function() {
                var changeCell = function(){
                    var row = this.row;
                    var col = this.col;
                    var n = cellN[0] * row + col;
                    rectSet[n].animate(
                        {"opacity": 0},
                        100,
                        function() {rectSet[n].remove()});
                    inField[row][col] = (inField[row][col] + 1) % 2;
                    var newCell = createRectCell(paper, Boolean(inField[row][col]), row, col).attr("fill-opacity", 0);
                    newCell.click(changeCell);
                    newCell.animate({"fill-opacity": 1}, 300,
                        function() {rectSet[n] = newCell}
                    )
                };

                rectSet.click(changeCell);
            };

            this.getField = function() {
                var res = [];
                for (var c = 0; c < inField.length; c++){
                    res.push(inField[c].slice(0, inField[c].length));
                }
                return res;
            };


        }


    }
);
