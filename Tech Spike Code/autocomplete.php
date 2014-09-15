<?php


if (isset($_GET["name"])) {
	$name = $_GET["name"];
} else {
	echo "invalid params";
	exit();
}


$databaseConnection = new mysqli("localhost","root","piedpiper2014","idiscovery");
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  return -1;
}


$stmt = $databaseConnection->prepare("SELECT Label FROM `GeogDesc` WHERE `Level` = 'SSC' AND `Label` LIKE ? ");

$name = $name.'%';
$stmt->bind_param("s", $name);

$stmt -> execute();
$stmt->bind_result($nameResult);

$returnArray = Array();

while ($stmt->fetch()) {
    array_push($returnArray, $nameResult);
}

echo json_encode($returnArray);
$stmt->close();
$databaseConnection -> close();
?>
