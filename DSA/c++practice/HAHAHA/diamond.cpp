#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    for(int i=1;i<=n;i++){
        //space
        for (int j=1;j<=n-i;j++){
            cout<<" ";
        }   //num
        for (int j=1;j<=i;j++){
            cout<<j;
        }//rev num
        for (int k=i-1;k>=1;k--){
            cout<<k;
        }cout<<endl;
    }
    for(int i=n-1;i>=1;i--){
        //space
        for (int j=1;j<=n-i;j++){
            cout<<" ";
        }   //num
        for (int j=1;j<=i;j++){
            cout<<j;
        }//rev num
        for (int k=i-1;k>=1;k--){
            cout<<k;
        }cout<<endl;
    }
return 0;
}
