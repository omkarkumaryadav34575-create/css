#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    int l;
    int rev=0;
    while(n!=0){
        rev=rev*10;
        l=n%10;
        rev=rev+l;
        n=n/10;

        }cout<<rev<<endl;
    return 0;
}