var selectedTableName="";
var firstTime;
var tabsFlag=true;
$(document).ready(function(){
    /********************  AJAX  ****************** */
    
    $( "#tabs" ).tabs();
    $("#tablesTab").click(function(){
        tabsFlag=true;
        $("#tables-container").html("")
        establishTables(true);
    });
    $("#kitchenTab").click(function(){
        tabsFlag=false;
        $("#tables-container").html("")
        establishTables(true);
    });

    setInterval(function(){
        if(tabsFlag)
        {
            if(selectedTableName=="")
                establishTables(false);
        }
        else
        {
            getKitchen();
        }
    },5000);
    getKitchen();
    establishTables();

    /*************************** JS ***********************/




    /*************************** UI ***********************/
});
function establishTables(firstTime=true) //its fetch tables and code of onclick on tables
{
    console.log("fetching tables");
    if(firstTime)
        $("#loader").show();
    $.post("action.php",{flag:"getTable"},function(data){
        if(firstTime)
            $("#loader").hide();
        $("#tables-container").html(data)
        $(".dining-table div").height($(".dining-table div").width()); //it makes width == height of table div
        var height = $(".dining-table").height();
        $(".arrows , .totalItemLabel").css({
            "margin-top":height/2+10+"px"
        });
        

        $(".dining-table div").click(function(){
            var name = $(this).children().first().html();
            if(name!=selectedTableName)
            {
                selectedTableName = $(this).children().first().html();
                obj = $(this).parent();
                $('.dining-table').not(obj).each(function(){
                    $(this).hide(500);
                });
                $(".backArrow").fadeIn();
                $(".forwardArrow").fadeIn();
            }
            tableSelected(selectedTableName);
        });
        $(".backArrow").click(function(){
            $(".forwardArrow").fadeOut();
            $("#tables-container .dining-table ").show(500);
            $(".backArrow").fadeOut();
            $("#menu-container").slideUp();
            $(".totalItemLabel b").html(totalItems=0);
            selectedProducts={};
            selectedTableName='';
        });
        console.log("tables fetched.");
    });
}
var selectedTableId = selectedTableIsOcuupied = 0;
function setTableId(tableId) //call from tag
{
    selectedTableId = tableId;
    tId = "dining-table"+selectedTableId;
    if($("#"+tId).hasClass("Occupied"))
    {
        selectedTableIsOcuupied=1;
        showOrderedList(selectedTableId);
    }
}
function tableSelected(tableName) //its fetch catagories and products
{
    $("#loader").show();
    data="";
    $("#menu-container").slideDown();
    $.post("action.php",{flag:"getMenu"},function(data,status){
        if(status=="success"){
            $("#loader").hide();
            $("#menu-container").html(data);

            $(".catName").click(function(){
                if($(this).parent().children("ul").is(":visible"))
                {
                    $(".catBox").trigger('mouseleave');
                }
                else
                {
                    width = $(this).parent().width();
                    $(this).parent().children("ul").slideDown();
                    $(this).parent().children("div").children("span").css({
                        "transform": "rotate(180deg)",
                        "padding-left":"10px"
                    });
                    $(this).parent().children("ul").css({    
                        "min-width":width+"px"
                    });
                }

                $(".catBox").mouseleave(function(){
                    $(".catBox ul").slideUp();
                    $(this).children("div").children("span").css({
                        "transform": "rotate(0deg)",
                        "padding-left":"10px"
                    });
                });
            });
            $("#tables-container").click(function(){
                $(".catBox ul").slideUp();
            });
        }
        
    });
}
function informToCoock(){
    console.log("bhai bhai");
    $(".counter").html(0);
    $(".totalItemLabel b").html(totalItems=0);
    if(!jQuery.isEmptyObject(selectedProducts))
    {
        $.ajax({
            type: "POST",
            url: "action.php",
            data: {
                flag:"itemSelected",
                selectedItems:selectedProducts,
                tableId:selectedTableId
            },
            success: function(data){
                console.log(data);
                console.log(selectedProducts);
                tId = "dining-table"+selectedTableId;
                $("#"+tId).addClass("Occupied");
                showOrderedList(selectedTableId);
                selectedProducts={};
            }
        });
    }
}

var selectedProducts = {}
var totalItems = 0;
function addQ(id){
    Qid="Q"+id;
    var val = 0;
    val = parseInt($("#"+Qid).html());
    if(val<10)
    {
        val++;
        $("#"+Qid).html(val);
        selectedProducts[id]=val;
        $(".totalItemLabel b").html(++totalItems);
    }
}
function subtractQ(id){
    Qid="Q"+id;
    var val = 0;
    val = parseInt($("#"+Qid).html());
    if(val>0)
    {
        val--;
        $("#"+Qid).html(val);
        selectedProducts[id]=val;
        $(".totalItemLabel b").html(--totalItems);
        if(val==0)
            delete selectedProducts[id];
    }
}

function showOrderedList(TId){
    $("#dialog").html("<br><center>Loadning...</center>").dialog();
    $.ajax({
        type: "POST",
        url: "action.php",
        data: {
            flag:"getOrderedList",
            tableId:selectedTableId
        },
        success: function(data){
            $("#dialog").dialog("close");
            $("#dialog").html("<p>"+data+"</p>").dialog({
                modal: true,
                buttons: {
                    'Get Bill': function() {
                      getInvoice(selectedTableId);
                    },
                    'Close': function() {
                      $( this ).dialog( "close" );
                    }
                },
                width:320,
                maxHeight:400
            });
        }
    });
}

function getInvoice(tableId){
    $.ajax({
        type: "POST",
        url: "action.php",
        data: {
            flag:"getInvoice",
            tableId:selectedTableId
        },
        success: function(data){
            inputEmailCode = "<hr> Email : <input id='customerEmail' type='email' name='customermail' placeholder='email address (optional)'/>";
            $("#dialog").html("<p>"+data+"</p>"+inputEmailCode).dialog({
                modal: true,
                buttons: {
                    'Print': function() {
                    $("#print_page_conainer").html(data);
                      $( this ).dialog( "close" );
                      window.print();
                      $(".backArrow").trigger('click');
                      $("#printing_row").css("display","block");
                      var email = $("#customerEmail").val();
                      validateEmail(email);
                      validate();
                    },
                    'Close': function() {
                      $( this ).dialog( "close" );
                      $("#print_page_conainer").html("");
                    }
                },
                width:320,
                'title':"Invoice Generated"
            });
            $("#dialog").animate({scrollTop:1000},1000);
            console.log("invoice stored into table");
        }
    });
}

function getKitchen()
{
    $.ajax({
        type: "post",
        url: "action.php",
        data: {
            flag:"getKitchen"
        },
        success: function (kitchenList) {
            $("#loader").hide();
            $("#kitchen").html(kitchenList);
            totalReady();
        }
    });
}
function takedKitchen(kitchenId)
{
    totalReady(-1);
    $.ajax({
        type: "post",
        url: "action.php",
        data: {
            flag:"itemTaked",
            id:kitchenId
        },
        success: function (kitchenList) {
            console.log("kitchen id : "+kitchenList+" setted as isReady = 0");
            $("#ktchen"+kitchenId).fadeOut();
        }
    });
}

function totalReady(l=0)
{
    var len = $("#kitchenTable tr").length-1;
    len+l;
    if(len==0)
    {
        $("#noItemText").show();
        $("#totalReady").html("");
    }
    else
    {
        $("#totalReady").html("("+len+")");
        $("#noItemText").hide();
    }
}


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
  function validate() {
    var $result = $("#customerEmail");
    var email = $("#customerEmail").val();
    if (validateEmail(email)) {
      $result.text(email + " is valid :)");
      $result.parent("p").val("Email was sent");
      $result.css("color", "green");

      $.ajax({
        type: "POST",
        url: "action.php",
        data: {
            flag:"sendMail",
            emailId:email,
            content:$("#print_page_conainer").html()
        },
        success: function(data){
            console.log("Mail was sent..  ");
        }
    });

    } else {
      $result.text(email + " is not valid :(");
      $result.css("color", "red");
      $result.val("");
    }
    return false;
  }