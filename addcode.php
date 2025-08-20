<?php
$data = json_decode(file_get_contents("php://input"), true);
$file = "codes.json";
$codes = [];

if(file_exists($file)){
  $codes = json_decode(file_get_contents($file), true);
}

$codes[] = [
  "title" => $data["title"],
  "desc"  => $data["desc"],
  "code"  => $data["code"],
  "lang"  => $data["lang"]
];

file_put_contents($file, json_encode($codes, JSON_PRETTY_PRINT));
echo json_encode(["status"=>"ok"]);
?>
