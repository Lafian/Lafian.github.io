<?
$ran= rang(0000, 9999);
$put='image/';
if (isset($_FILES['filename'] ['name']) && ($_FILES['filename']
['name'] !='')){
$name = $_FILES["filename"] ["name"];
move_upload_file($_FILES["filename"] ["tmp_name"],$put.$ran.
$name);
$namefile=$ran.$name;
echo "True";
}
else{
echo "False";
}
?>