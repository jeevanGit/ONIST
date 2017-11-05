
// Sample input
var arrayVals = ['blah', 'param', '12dh', '-fdjskl', '8-4', 'Peter', '66', 'Pan'];

/*
    Sort Criteria:
    - first, all items that begin with a digit, in reverse-alphabetical order
    - then all items that do not begin with a capital "P", in alphabetical order
    - then all items that do begin with a capital "P", in reverse-alphabetical order

    Algorithm: vaguely follows divide and conquer
*/
function f(strArray) {
    var numberArray= [];
    var Parray = [];
    var regularArray= [];

    /* Time complexity for this block is O(n). Split the array based on the criteria */
    for(var i=0; i < strArray.length; i++) {
        var firstLetter = strArray[i].charAt(0);
        if(!isNaN(firstLetter)) {
            numberArray.push(strArray[i]);
        } else if (firstLetter == 'P') {
            Parray.push(strArray[i]);
        } else {
            regularArray.push(strArray[i]);
        } 
    }

    /* 
    Even though time complexity is implementation dependent. Concat as well as reverse operation for 
    an array is O(n). 
   
    Total time complexity = O(n) + O(n) ... O(n) = O(7n) ~ O(n)
    Time complexity = O(n) 
    */
    numberArray = numberArray.sort().reverse();
    regularArray = regularArray.sort();
    Parray = Parray.sort().reverse();
   
    return numberArray.concat(regularArray).concat(Parray);
}

console.log(f(arrayVals));