#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int original=n;
    int digit=0;
    int num=0;
    while(n>0){
        digit=n%10;
        num=num*10+digit;
        n=n/10;
    }if(num==original){
        cout<<"palindrome";
    }else cout<<"not a palindrome;";
cout<<endl;
    return 0;
}