<?php
header("Access-Control-Allow-Origin: *");
header("Content-type", "application/javascript; charset=utf-8");

$soichToim = $_GET['q'];
$pdl = $_GET['pdl'];
$fn = hash('md5', $soichToim);

$ffn = "cache/$fn";

//$parse_js = file_get_contents("parse.min.js");

function output($parse_js, $res) {
        $jsonp = file_get_contents("search.json");
        $out = str_replace("%results%", $res, $jsonp);

        echo $out;
    return;
}

if(file_exists($ffn)) {
        output($parse_js, file_get_contents($ffn));
        exit;
}

set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__ . DIRECTORY_SEPARATOR . 'google-api-php-client/src/Google');

require_once './google-api-php-client/autoload.php';

$client = new Google_Client();
$client->setApplicationName("Plag-Search");

$apiKey = "AIzaSyA5IKI8oW-TkfmW9Q7qdg95erkvdue4jHc";

$client->setDeveloperKey($apiKey);

$soich = new Google_Service_Customsearch($client);
$optParams =array("cx" => "005251477991835482624:5ve9pjqcg5i");

$res = $soich->cse->listCse(urlencode($soichToim), $optParams);
$match_result = array();

foreach($res["modelData"]["items"] as $item) {
    $m = getPercentageMatch($soichToim, $item['htmlSnippet'], $tolerance);

    if(! empty($m) ) {
        $m[0]['displayLink'] = $item['displayLink'];
        $m[0]['link'] = $item['link'];
        
        $match_result = array_merge($match_result, $m);
    }
}

usort($match_result, _filter);
$match_result = array_slice($match_result, 0, 3);

$json = json_encode($match_result);

file_put_contents($ffn, $json);

output($parse_js, $json);

function getPercentageMatch($searchTerm, $snippet, $tolerance) {
    
    $snippet = trim($snippet);
    $sterm_len = strlen(trim($searchTerm));
    
    $test_snippet = strip_tags($snippet);

    $p_sterm_len = (100 / $sterm_len) * $tolerance;
    
    $min = $sterm_len - $p_sterm_len;
    $max = $sterm_len + $p_sterm_len;
    
    $dom = new DOMDocument('1.0');
    
    $dom->loadHtml($snippet);
    
    $n_matched = array();
    
    
    $xpath = new DOMXpath($dom);
    $textNodes = $xpath->query('//text()');
    
    $nodeCount = 0;
    
    $matches = array();
    
    $punct = "";
  
    foreach($textNodes as $node) {
        $node_exists = FALSE;
        $r = array(",", "!", "?", "-");
        $clean = str_replace($r, "", trim($node->data));
        $tlen = strlen($clean);
        
        //var_dump($node->parentNode);
        if($node->parentNode->tagName == 'b') {
            $mc = count($matches);
            
            // store node index in array with mc to allow comparison @FIXME
            if($mc > 0) {
                if(isset($matches[ $mc - 1 ]["index"]) && checkRange($nodeCount-2, $nodeCount, $matches[ $mc - 1 ]["index"])) {
                    $text = $matches[ $mc - 1 ]["text"];
                    $matches[ $mc - 1 ]["text"] = $text . $punct . $node->data;
                    $punct = "";
                    $node_exists = TRUE;
                }
            }
            
            else if($tlen > 3) {
                $matches[] = array("text" => $node->data, 
                                   "index" => $nodeCount); 
                $nodeCount = $nodeCount + 1;
            } 
        }
      
        if($tlen < 4) {
            $punct = $node->data;   
        } else if(! $node_exists) {
            $nodeCount = $nodeCount + 1;   
        }
    }
    
    foreach($matches as $t) {
        $percent = 0;
        $match = similar_text($t["text"], $searchTerm, $percent);
        
        $n_matched[] = array("match" => $match, "phrase" => $searchTerm, "perc" => $percent, "displayLink" => "#", "link" => "#");
    }
    
    return $n_matched;
}

function _filter($a, $b) {
    if(empty($pdl)) {
        return $a['perc'] < $b['perc'];
    } else {
        return $a['link'] == $pdl; //||  $a['perc'] < $b['perc'];
    }
}

function checkRange($min, $max, $value) {
    return ($min <= $value) && ($value <= $max);  
}

