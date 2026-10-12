#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int digit;
    int largest=-1;
    int second_largest=-1;
    while(n>0){
       int digit=n%10;
       if(digit>largest){
        second_largest=largest;
        largest=digit;
        
       }else if(digit>second_largest &&digit!=largest){
        second_largest=digit;
       }n=n/10;

        
    }cout << "Largest: " << largest << endl;
    cout << "Second largest: " << second_largest << endl;

    return 0;
}