import java.util.*;

class Solution {
    public static String mapWordWeights(String[] words, int[] weights) {
        HashMap<String,Integer> map = new HashMap<>();
        char ch = 'a';
        for(int i=0; i<weights.length; i++){
            map.put(String.valueOf(ch),weights[i]);
            ch++;
        }
        System.out.println(map);
        String res = "";
        for(int i=0; i<words.length; i++){
            String s = words[i];
            int sum = 0;
            for(int j=0; j<s.length(); j++){
                // System.out.println(s.charAt(j));
                if(map.containsKey(String.valueOf(s.charAt(j)))){
                    
    
                    sum += map.get(String.valueOf(s.charAt(j)));
                }
            }
            sum = 26 - (sum%26);
            res += (char)('a' + sum - 1);
            System.err.println("curr res = "+res);          
        }

        return res;
    }

    public static void main(String[] args) {
        String [] s = {"abcd","def","xyz"};
        int [] arr = {5,3,12,14,1,2,3,2,10,6,6,9,7,8,7,10,8,9,6,9,9,8,3,7,7,2};

        System.out.println(mapWordWeights(s, arr));
    }
}