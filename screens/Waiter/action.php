<?php
    include "../../config.php";
    $mycon = new config();
    $con = $mycon->db();
    
    $flag="";
    if(isset($_POST['flag']))
        $flag = $_POST['flag'];
    else
        echo "<script>window.location='index.php';</script>";
    
        if($flag=="getTable")
        getTable($con);    
        if($flag=="getMenu")
            getMenu($con);

    
    
    
    
    function getTable($con)
    {  
        $data = mysqli_query($con,"SELECT * FROM `tables`");
        while($row = mysqli_fetch_array($data))
        { 
            if($row[3]==1)
                $class="Occupied";
            else
                $class="";
            echo"
            <div class='dining-table  $class col-lg-2 col-md-2 col-sm-2 col-xs-3'>
                <div>
                    <h3>$row[1]</h3>
                </div>
            </div><!-- .dining-table -->";
        }
        echo "
        <div class='totalItemLabel backArrow dining-table  $class col-lg-2 col-md-2 col-sm-2 col-xs-3'>
                <div style='background:rgba(0,0,0,0.1);'>
                    <b>ITEMS <br> 6 </b>
                </div>
            </div>
        <div class=' forwardArrow col-lg-1 col-md-1 col-sm-1 col-xs-2'>
            <center><i class='fas fa-arrow-alt-circle-right arrows'></i></center>
        </div>";
    }

    function getMenu($con)
    {
        $data = mysqli_query($con,"SELECT * from `products`");
        while($row = mysqli_fetch_array($data)){
            print_r($row);
        }
    }
?>